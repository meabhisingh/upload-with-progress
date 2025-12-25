import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Upload with Progress</span>,
  project: {
    link: "https://github.com/meabhisingh/upload-with-progress",
  },

  feedback: {
    content: "",
    labels: "",
    useLink: () => "",
  },
  footer: {
    component: null,
  },
  editLink: {
    component: null,
  },
};

export default config;
