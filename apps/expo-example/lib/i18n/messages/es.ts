export const es = {
  common: {
    learnMore: 'Aprende más',
  },
  explore: {
    intro: 'Esta app incluye código de ejemplo para ayudarte a comenzar.',
    sections: {
      animations: {
        bodyIntro: 'Esta plantilla incluye un ejemplo de un componente animado. El componente',
        bodyMiddle: 'usa la potente librería',
        bodyOutro: 'para crear una animación de saludo con la mano.',
        iosBodyIntro: 'El componente',
        iosBodyOutro: 'provee un efecto parallax para la imagen del encabezado.',
        title: 'Animaciones',
      },
      images: {
        bodyIntro: 'Para imágenes estáticas, puedes usar los sufijos',
        bodyMiddle: 'y',
        bodyOutro: 'para proveer archivos para distintas densidades de pantalla.',
        title: 'Imágenes',
      },
      platforms: {
        body: 'Puedes abrir este proyecto en Android, iOS y la web. Para abrir la versión web, presiona w en la terminal que está ejecutando este proyecto.',
        title: 'Soporte para Android, iOS y web',
      },
      routing: {
        and: 'y',
        layoutIntro: 'El archivo de layout en',
        layoutOutro: 'configura el navegador de pestañas.',
        screensIntro: 'Esta app tiene dos pantallas:',
        title: 'Enrutamiento basado en archivos',
      },
      theme: {
        bodyIntro: 'Esta plantilla tiene soporte para modo claro y oscuro. El hook',
        bodyMiddle:
          'te permite inspeccionar el esquema de color actual del usuario para ajustar los colores de la UI.',
        title: 'Componentes para modo claro y oscuro',
      },
    },
    title: 'Explorar',
  },
  header: {
    switchLocaleTo: 'Cambiar a {locale}',
  },
  home: {
    steps: {
      explore: {
        action: 'Acción',
        actionPressed: 'Acción presionada',
        body: 'Toca la pestaña Explorar para aprender más sobre lo que incluye esta app inicial.',
        delete: 'Eliminar',
        deletePressed: 'Eliminar presionado',
        more: 'Más',
        share: 'Compartir',
        sharePressed: 'Compartir presionado',
        title: 'Paso 2: Explora',
      },
      reset: {
        currentApp: 'app',
        currentAppDestination: 'app-example',
        currentAppLabel: 'app',
        directoryOutro: 'vacío. Esto moverá el',
        freshIntro: 'para obtener un nuevo directorio',
        intro: 'Cuando estés listo, ejecuta',
        title: 'Paso 3: Empieza desde cero',
        toLabel: 'actual a',
      },
      try: {
        editIntro: 'Edita',
        editOutro: 'para ver cambios. Presiona',
        title: 'Paso 1: Pruébalo',
        toolsOutro: 'para abrir las herramientas de desarrollo.',
      },
    },
    title: '¡Bienvenido!',
  },
  modal: {
    backToHome: 'Ir a la pantalla principal',
    title: 'Este es un modal',
  },
  navigation: {
    explore: 'Explorar',
    home: 'Inicio',
  },
} as const;

export default es;
