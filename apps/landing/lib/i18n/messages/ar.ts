export const ar = {
  codeDemo: {
    description:
      "نفس التكوين يعمل بالطريقة ذاتها سواء كنت في Next.js أو Astro أو React أو Node عادي.",
    title: "واجهة API واحدة. كل بيئة",
  },
  features: {
    description:
      "نفس الإعداد، نفس الـ API، نفس التجربة ,  بغض النظر عن بيئة TypeScript التي تعمل بها.",
    items: {
      autocomplete: {
        description:
          'المحرر الخاص بك يعرف كل مفتاح في كائن رسائلك. لا مزيد من التخمين لأن `t("home.` يبدأ الإكمال فورًا.',
        title: "الإكمال التلقائي في كل مكان",
      },
      frameworkAgnostic: {
        description:
          "اكتب تكوين الترجمة مرة واحدة. يعمل بالطريقة ذاتها في Next.js وAstro وReact وTanStack Router وNode عادي. غيّر البيئة، واحتفظ بإعدادك.",
        title: "نفس التكوين، كل بيئة",
      },
      localeSwitching: {
        description:
          "تبديل اللغات أثناء التشغيل بدون إعادة تحميل الصفحة. السماحات المستندة إلى الاستدعاء تتيح لك عرض أي لغة عند الطلب.",
        title: "تبديل اللغة",
      },
      typeSafe: {
        description:
          "استنتاج TypeScript كامل لمفاتيح الترجمات ومتغيرات الاستبدال. الأخطاء الإملائية والمفاتيح المفقودة تصبح أخطاء بنائية.",
        title: "نوع آمن افتراضيًا",
      },
    },
    title: "نفس الإعداد. كل بيئة",
  },
  footer: {
    docs: "الوثائق",
    github: "GitHub",
    legal: "MIT License · مبني باستخدام TypeScript",
    npm: "npm",
  },
  frameworks: {
    description:
      "تكوين الترجمة الخاص بك يعمل بنفس الطريقة في كل بيئة TypeScript. موائمات أصلية، API متطابقة.",
    heroDescription: "غيّر الإطار بدون إعادة كتابة إعداد i18n الخاص بك",
    heroTitle: "نفس التكوين في كل مكان",
    items: {
      astro: {
        description:
          "مساعدات لكل طلب ومجموعات محتوى Astro محلية لكل من .md و .mdx.",
      },
      bun: {
        description: "دعم وقت تشغيل Bun أصلي بدون إعداد إضافي.",
      },
      nextjs: {
        description:
          "مكوّنات الخادم، App Router، ومساعدات اللغة المرتبطة بالمسار.",
      },
      nodejs: {
        description: "نواة بلا تبعيات للسكريبتات والخوادم والمهام الخلفية.",
      },
      react: {
        description:
          "السياق، والـ hooks، وعرض عميل يعتمد على اللغة لتطبيقات React.",
      },
      tanstack: {
        description:
          "دعم توجيه آمن النوع لمشاريع TanStack Router، بما فيها تطبيقات TanStack Start.",
      },
      typescript: {
        description:
          "أنواع قوية، إكمال تلقائي، وتغذية راجعة من رسائلك أثناء البناء.",
      },
    },
    title: "إطارك، اختيارك",
  },
  header: {
    changelog: "Changelog",
    cli: "CLI",
    closeMenu: "إغلاق القائمة",
    docs: "الوثائق",
    github: "GitHub",
    language: "اللغة",
    languageSwitcher: "تبديل اللغة",
    openMenu: "فتح القائمة",
  },
  hero: {
    badge: "نفس التكوين. كل بيئة TypeScript",
    description:
      "نفس التكوين. نفس الـ API. يعمل في Next.js وAstro وReact وTanStack Router وNode عادي بدون إعادة كتابة.",
    primaryCta: "عرض الوثائق",
    secondaryCta: "عرض على GitHub",
    title: "إعداد i18n واحد لأي مشروع TypeScript",
  },
  docs: {
    copyMarkdown: "نسخ ماركداون",
    copiedMarkdown: "تم النسخ",
    header: {
      home: "الصفحة الرئيسية",
      github: "GitHub",
    },
    sidebar: {
      rtl: "RTL",
      adapters: "الموائمات",
      astro: "Astro",
      changelog: "Changelog",
      cli: "CLI",
      core: "النواة",
      expo: "Expo",
      gettingStarted: "البدء",
      installation: "التثبيت",
      introduction: "مقدمة",
      mission: "المهمة",
      mdAndMdx: "MD و MDX",
      nextjs: "Next.js",
      react: "React",
      skills: "المهارات",
      tanstackStart: "TanStack Router",
    },
  },
} as const;

export default ar;
