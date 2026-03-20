export const en = {
  common: {
    learnMore: 'Learn more',
  },
  explore: {
    intro: 'This app includes example code to help you get started.',
    sections: {
      animations: {
        bodyIntro: 'This template includes an example of an animated component. The',
        bodyMiddle: 'component uses the powerful',
        bodyOutro: 'library to create a waving hand animation.',
        iosBodyIntro: 'The',
        iosBodyOutro: 'component provides a parallax effect for the header image.',
        title: 'Animations',
      },
      images: {
        bodyIntro: 'For static images, you can use the',
        bodyMiddle: 'and',
        bodyOutro: 'suffixes to provide files for different screen densities.',
        title: 'Images',
      },
      platforms: {
        body: 'You can open this project on Android, iOS, and the web. To open the web version, press w in the terminal running this project.',
        title: 'Android, iOS, and web support',
      },
      routing: {
        and: 'and',
        layoutIntro: 'The layout file in',
        layoutOutro: 'sets up the tab navigator.',
        screensIntro: 'This app has two screens:',
        title: 'File-based routing',
      },
      theme: {
        bodyIntro: 'This template has light and dark mode support. The',
        bodyMiddle:
          "hook lets you inspect the user's current color scheme so you can adjust UI colors accordingly.",
        title: 'Light and dark mode components',
      },
    },
    title: 'Explore',
  },
  header: {
    switchLocaleTo: 'Switch to {locale}',
  },
  home: {
    steps: {
      explore: {
        action: 'Action',
        actionPressed: 'Action pressed',
        body: "Tap the Explore tab to learn more about what's included in this starter app.",
        delete: 'Delete',
        deletePressed: 'Delete pressed',
        more: 'More',
        share: 'Share',
        sharePressed: 'Share pressed',
        title: 'Step 2: Explore',
      },
      reset: {
        currentApp: 'app',
        currentAppDestination: 'app-example',
        currentAppLabel: 'app',
        directoryOutro: 'directory. This will move the current',
        freshIntro: 'to get a fresh',
        intro: "When you're ready, run",
        title: 'Step 3: Get a fresh start',
        toLabel: 'to',
      },
      try: {
        editIntro: 'Edit',
        editOutro: 'to see changes. Press',
        title: 'Step 1: Try it',
        toolsOutro: 'to open developer tools.',
      },
    },
    title: 'Welcome!',
  },
  modal: {
    backToHome: 'Go to home screen',
    title: 'This is a modal',
  },
  navigation: {
    explore: 'Explore',
    home: 'Home',
  },
} as const;

export default en;
