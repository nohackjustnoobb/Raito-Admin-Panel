import { addMessages, getLocaleFromQueryString, init } from "svelte-i18n";

import en from "./en.json";
import zh from "./zh.json";

addMessages("en", en);
addMessages("zh", zh);

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromQueryString("lang"),
});
