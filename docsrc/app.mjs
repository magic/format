export const state = {
  title: '@magic/format',
  description: ['run prettier and format your code.'],

  logotext: '@magic/format',
  menu: [
    { to: '-install', text: 'install' },
    {
      to: '/#usage',
      text: 'usage',
      items: [
        { to: '-js', text: 'js api' },
        { to: '-cli', text: 'cli' },
        { to: '-global', text: 'npm i -g' },
      ],
    },
    { to: '/#changelog', text: 'changelog' },
  ],
}
