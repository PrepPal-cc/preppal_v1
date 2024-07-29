'use server'

import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import pdf from 'pdf-parse'
import { remark } from 'remark'
import html from 'remark-html'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

export async function prepareInterview(formData: FormData) {
  try {
    const companyName = formData.get('companyName') as string
    const resumeFile = formData.get('resume') as File

    if (!companyName || !resumeFile) {
      throw new Error('Missing required fields')
    }

    // 1. Extract text from resume
    const resumeBuffer = await resumeFile.arrayBuffer()
    const resumeData = await pdf(Buffer.from(resumeBuffer))
    const resumeText = resumeData.text

    // 2. Query OpenAI model
    const systemMessage = `You are an expert at preparing for interviews at tech companies. Your task is to help a Computer Science student prepare for an interview.`

    const userMessage = `Given the information about the company I am interviewing with and my resume, generate an agenda for a 30 minute interview with the company. For each section of the agenda, include specific topics to discuss based on my resume and general knowledge about the company.

Company Name: ${companyName}

Resume:
${resumeText}

Please provide a structured guide with talking points and potential questions for each section of the agenda. Focus on the company's known products, services, and technologies, as well as how my skills from the resume might be relevant.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]
    })

    const response = completion.choices[0].message.content

    // Convert markdown to HTML if response is not null
    const htmlResponse = response ? await markdownToHtml(response) : ''

    revalidatePath('/prep')
    return { response: htmlResponse }
  } catch (error) {
    console.error('Error in prepareInterview:', error);
    throw error;
  }
}