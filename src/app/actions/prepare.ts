'use server'

import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import axios from 'axios'
import cheerio from 'cheerio'
import pdf from 'pdf-parse'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function prepareInterview(formData: FormData) {
  const url = formData.get('url') as string
  const resumeFile = formData.get('resume') as File

  if (!url || !resumeFile) {
    throw new Error('Missing required fields')
  }

  // 1. Extract text from resume
  const resumeBuffer = await resumeFile.arrayBuffer()
  const resumeData = await pdf(Buffer.from(resumeBuffer))
  const resumeText = resumeData.text

  // 2. Scrape website
  const { data: websiteHtml } = await axios.get(url)
  const $ = cheerio.load(websiteHtml)
  const websiteText = $('body').text()

  // 3. Query OpenAI model
  const systemMessage = `You are an expert at preparing for interviews at Big Tech companies. Your task is to help a Computer Science student prepare for an interview.`

  const userMessage = `Given the information about the company I am interviewing with below, generate an agenda for a 30 minute interview with the company. For each section of the agenda, include specific topics to discuss based on my resume and the company's website.

Resume:
${resumeText}

Company Website:
${websiteText}

Please provide a structured guide with talking points and potential questions for each section of the agenda.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 1000,
  })

  const response = completion.choices[0].message.content

  revalidatePath('/prep')
  return { response }
}