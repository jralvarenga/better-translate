export const ar = {
  codeDemo: {
    description: "اضبط الإعداد مرة واحدة، وأنشئ مساعدين مكتوبَي النوع في كل مكان.",
    title: "واجهة برمجية بسيطة من خطوتين",
  },
  features: {
    description: "كل ما تحتاجه لترجمة احترافية جاهزة للإنتاج، بدون أي زيادات.",
    items: {
      autocomplete: {
        description:
          'محررك يعرف كل مفتاح في كائن الرسائل. لا مزيد من التخمين لأن `t("home.` تبدأ بالإكمال التلقائي فوراً.',
        title: "إكمال تلقائي في كل مكان",
      },
      frameworkAgnostic: {
        description:
          "صفر اعتمادية على إطار عمل معين. حزمة أساسية واحدة، ومحولات متكاملة لـ React وNext.js وTanStack Router وNode.js العادي.",
        title: "مستقل عن الإطار",
      },
      localeSwitching: {
        description:
          "قم بتبديل اللغات في وقت التشغيل دون إعادة تحميل الصفحة. تتيح لك التجاوزات لكل استدعاء عرض أي لغة عند الطلب.",
        title: "تبديل اللغة",
      },
      typeSafe: {
        description:
          "استنتاج TypeScript كامل على مفاتيح الترجمة ومتغيرات الاستيفاء. تصبح الأخطاء المطبعية والمفاتيح المفقودة أخطاء وقت ترجمة.",
        title: "آمن النوع افتراضياً",
      },
    },
    title: "مبني لفرق TypeScript",
  },
  footer: {
    docs: "التوثيق",
    github: "GitHub",
    legal: "رخصة MIT · مبني بـ TypeScript",
    npm: "npm",
  },
  frameworks: {
    description:
      "نواة ترجمة مشتركة واحدة. محولات أصلية لكل إطار عمل TypeScript رئيسي، أو استخدم النواة مباشرة.",
    heroDescription:
      "بدون اعتمادية على إطار معين - نواة واحدة، صفر تبعيات وقت التشغيل",
    heroTitle: "يعمل مع أي مشروع TypeScript",
    items: {
      bun: {
        description: "دعم وقت تشغيل Bun الأصلي بدون إعداد إضافي.",
      },
      nextjs: {
        description: "مكونات الخادم، App Router، ومساعدات اللغة المدركة للمسارات.",
      },
      nodejs: {
        description: "نواة بدون تبعيات للسكريبتات والخوادم والمهام الخلفية.",
      },
      react: {
        description: "السياق والـ hooks وعرض العميل المدرك للغة لتطبيقات React.",
      },
      tanstack: {
        description: "دعم التوجيه الآمن للنوع لمشاريع TanStack Router، بما في ذلك تطبيقات TanStack Start.",
      },
      typescript: {
        description: "أنواع قوية وإكمال تلقائي وتغذية راجعة وقت الترجمة من رسائلك.",
      },
    },
    title: "إطارك، اختيارك",
  },
  header: {
    changelog: "سجل التغييرات",
    cli: "واجهة سطر الأوامر",
    closeMenu: "إغلاق القائمة",
    docs: "التوثيق",
    github: "GitHub",
    language: "اللغة",
    languageSwitcher: "تبديل اللغة",
    openMenu: "فتح القائمة",
  },
  hero: {
    badge: "مستقل عن الإطار - يعمل في أي مشروع TypeScript",
    description:
      "حدد ترجماتك مرة واحدة. احصل على إكمال تلقائي وأخطاء النوع وتبديل اللغة - بدون اعتمادية على إطار. يعمل في أي قاعدة كود TypeScript.",
    primaryCta: "عرض التوثيق",
    secondaryCta: "عرض على GitHub",
    title: "ترجمات آمنة النوع لـ TypeScript",
  },
  docs: {
    copyMarkdown: "نسخ Markdown",
    copiedMarkdown: "تم النسخ",
    header: {
      home: "الرئيسية",
      github: "GitHub",
    },
    sidebar: {
      rtl: "RTL",
      adapters: "المحولات",
      changelog: "سجل التغييرات",
      cli: "واجهة سطر الأوامر",
      core: "النواة",
      gettingStarted: "البدء",
      installation: "التثبيت",
      introduction: "المقدمة",
      mdAndMdx: "MD & MDX",
      nextjs: "Next.js",
      react: "React",
      skills: "المهارات",
      tanstackStart: "TanStack Router",
    },
  },
} as const;
