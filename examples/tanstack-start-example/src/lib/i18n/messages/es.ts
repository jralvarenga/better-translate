export const es = {
  guide: {
    backToHome: "Volver al inicio",
    openLogin: "Abrir login",
    badge: "Detalle de ruta localizada",
    description:
      "Esta segunda pagina muestra que la guia, los enlaces y el selector de idioma permanecen dentro del idioma activo en la raiz de la app.",
    navigationDescription:
      "La app inyecta las primitivas de TanStack Router en createNavigationFunctions(), para que los enlaces y las llamadas de router localizadas sigan siendo compatibles con la version instalada.",
    navigationTitle: "Navegacion inyectada",
    routeTreeDescription:
      "Ahora todas las paginas visibles viven bajo el segmento obligatorio de locale, asi que inicio, guia y login comparten el mismo modelo de rutas localizadas.",
    routeTreeTitle: "Arbol con locale obligatorio",
    title: "Un arbol de rutas, dos idiomas y una app localizada desde la raiz.",
  },
  home: {
    badge: "Experiencia localizada desde la raiz",
    description:
      "Esta pagina mantiene la sensacion calmada de la tarjeta inicial, pero ahora todo el arbol de rutas se localiza desde la raiz con un parametro de locale obligatorio en TanStack Router.",
    primaryCta: "Ver guia localizada",
    secondaryCta: "Abrir login localizado",
    supportingCopy:
      "Cambia entre ingles y espanol desde el header superior. La ruta actual se conserva, mientras Better Translate mantiene localizados los enlaces y la navegacion.",
    title:
      "Rutas localizadas desde la raiz que se sienten nativas en TanStack Start.",
  },
  login: {
    badge: "Ruta de login localizada",
    description:
      "Login ahora forma parte del mismo arbol con locale obligatorio que el resto del ejemplo, por lo que la ruta, la navegacion del header y el selector de idioma se mantienen consistentes.",
    primaryCta: "Volver al inicio",
    secondaryCta: "Abrir guia",
    title: "Una pagina de login localizada sin salir del shell principal.",
  },
  navigation: {
    guide: "Guia",
    home: "Inicio",
    login: "Login",
    switchLanguage: "Idioma",
  },
} as const;
