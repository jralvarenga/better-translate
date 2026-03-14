import { t } from "better-translate/core";

t("routes.greeting", {
  params: {
    name: "Ada",
  },
});

// @ts-expect-error params are required for messages with placeholders
t("routes.greeting");

t("routes.greeting", {
  // @ts-expect-error the greeting message requires the `name` placeholder
  params: {},
});

t("routes.greeting", {
  params: {
    // @ts-expect-error only placeholders found in the message should be allowed
    user: "Ada",
  },
});
