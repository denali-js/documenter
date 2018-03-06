import { upperFirst } from 'lodash';

export default function(extension) {
  let isTypescript = extension === 'ts';
  let lang = isTypescript ? 'typescript' : 'javascript';
  return {
    name: `${ lang }-project`,
    version: '1.0.0',
    pages: {
      'introduction': {
        title: `A ${ isTypescript ? 'T' : 'J' }S Project Introduction`,
        contents: `# Introduction to ${ upperFirst(lang) } Project`
      },
      'nested/page': {
        contents: "# I'm nested!"
      }
    },
    api: {
      packages: {
        [`${ lang }-project`]: {
          classes: {
            Dog: {
              name: 'Dog',
              description: "He's such a good boi!\n\nNo srsly. such good",
              access: 'public',
              deprecated: false,
              line: isTypescript ? 6 : 1,
              file: `src/index.${ extension }`,
              tags: [],
              methods: {
                bark: {
                  access: 'public',
                  deprecated: false,
                  description: 'Make some noise',
                  file: `src/index.${ extension }`,
                  line: isTypescript ? 20 : 19,
                  name: 'bark',
                  inherited: isTypescript ? false : undefined,
                  signatures: [
                    {
                      parameters: [
                        {
                          description: 'How loud?',
                          name: 'volume',
                          type: 'number',
                        },
                      ],
                      return: {
                        description: undefined,
                        type: isTypescript ? 'void' : undefined
                      },
                    },
                  ],
                  tags: [],
                },
                requestBellyRub: {
                  access: 'protected',
                  deprecated: false,
                  description: 'Checks if this.goodBoi is true, and if so, requests a belly rub.\nReturns true if belly rub was successful.',
                  file: `src/index.${ extension }`,
                  line: isTypescript ? 33 : 31,
                  name: 'requestBellyRub',
                  inherited: isTypescript ? false : undefined,
                  signatures: [
                    {
                      parameters: [],
                      return: {
                        description: 'Was the belly rub successful?',
                        type: 'boolean',
                      },
                    },
                  ],
                  tags: [],
                },
                burrow: {
                  access: 'private',
                  deprecated: false,
                  description: 'Digs a hole in blankets or dirt',
                  file: `src/index.${ extension }`,
                  inherited: isTypescript ? false : undefined,
                  line: isTypescript ? 43: 44,
                  name: 'burrow',
                  signatures: [
                    {
                      parameters: [],
                      return: {
                        description: undefined,
                        type: isTypescript ? 'void' : undefined,
                      },
                    },
                  ],
                  tags: [],
                },
              },
              properties: {
                mood: {
                  access: 'public',
                  deprecated: false,
                  description: 'What\'s the dog\'s current mood?',
                  file: `src/index.${ extension }`,
                  inherited: isTypescript ? false : undefined,
                  line: isTypescript ? 12 : 11,
                  name: 'mood',
                  tags: [],
                  type: 'string',
                }
              },
              staticMethods: {},
              staticProperties: {}
            }
          },
          functions: [
            {
              access: 'public',
              deprecated: false,
              description: 'Pet the good boi!',
              file: `src/pet.${ extension }`,
              line: isTypescript ? 5 : 2,
              name: 'pet',
              signatures: [
                {
                  parameters: [],
                  return: {
                    description: undefined,
                    type: isTypescript ? 'void' : undefined,
                  },
                },
              ],
              tags: [],
            },
          ],
          interfaces: {}
        }
      }
    },
    documenter: {
      version: '1.0'
    }
  };
}