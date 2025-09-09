import { assistantPrompt, parseResponse, TheSeamDatatablePrompterProvider } from '../datatable-prompter-prompt-provider'

export class OpenRouterAiProvider implements TheSeamDatatablePrompterProvider {

  async submit(prompt: string): Promise<any> {
    const defaultApiKey = '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'

    // OpenRouter
    const url = 'https://openrouter.ai/api/v1/chat/completions'
    const apiKey = localStorage.getItem('openrouter-api-key') || defaultApiKey
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
    const model = 'google/gemini-2.5-flash'
    const responseFormat = { 'type': 'json_object' }

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'assistant',
            content: assistantPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: responseFormat,
      }),
    }).then(response => response.json()).then(data => {
      console.log('Response from AI:', data)

      const responseContent = data.choices[0].message.content

      console.log(`%cResponse from AI. content:\n${responseContent}`, 'color: limegreen;')

      // Replace "```json" at the start and "```" at the end
      // const alterations = responseContent.trim().replace(/^```json/, '').replace(/```$/, '').trim()

      // Parse the JSON string to an object, which is in the string between the code blocks.
      // So, need to find the first and last code block markers.
      // const startIndex = responseContent.indexOf('```json') + '```json'.length
      // const endIndex = responseContent.lastIndexOf('```')
      // const alterations = responseContent.substring(startIndex, endIndex).trim()

      // console.log('Alterations:', alterations)
      // return JSON.parse(alterations)

      return parseResponse(responseContent, responseFormat)
    }).catch(err => {
      console.error('Error submitting prompt:', err)
    })
  }
}
