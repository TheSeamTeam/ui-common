import {
  assistantPrompt,
  parseResponse,
  TheSeamDatatablePrompterProvider,
} from '../datatable-prompter-prompt-provider'

export class LmStudioAiProvider implements TheSeamDatatablePrompterProvider {
  async submit(prompt: string): Promise<any> {
    // Local
    const url = 'http://localhost:1234/v1/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
    }
    const model = 'model-identifier'

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
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Response from AI:', data)

        const responseContent = data.choices[0].message.content

        console.log(
          `%cResponse from AI. content:\n${responseContent}`,
          'color: limegreen;',
        )

        // Replace "```json" at the start and "```" at the end
        // const alterations = responseContent.trim().replace(/^```json/, '').replace(/```$/, '').trim()

        // Parse the JSON string to an object, which is in the string between the code blocks.
        // So, need to find the first and last code block markers.
        // const startIndex = responseContent.indexOf('```json') + '```json'.length
        // const endIndex = responseContent.lastIndexOf('```')
        // const alterations = responseContent.substring(startIndex, endIndex).trim()

        // console.log('Alterations:', alterations)
        // return JSON.parse(alterations)

        return parseResponse(responseContent, undefined)
      })
      .catch((err) => {
        console.error('Error submitting prompt:', err)
      })
  }
}
