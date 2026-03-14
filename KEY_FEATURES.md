# Key features

- Agnosting translations
  - use it on any node server with typescript or api with core package
  - react hooks
  - next js config
  - tanstack start
- Autocomplete (mapping based on passed .json and .ts files)
- Passing key params to strings (including autocomplete from ts)
- Key link (when clicking on translation redirects to file and like where the key is, using vscode extension) - [NEEDS FIX]
- Fixed return message bya passed locale
  - a message that is not linked to the setup local globally, for example default local is "en" but when passed t('...', { config: { locale: 'es } }) will return the message in "es"
