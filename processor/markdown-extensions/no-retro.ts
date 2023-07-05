import { extension } from "showdown";

extension("no-retro", () => {
  return [
    {
      type: "lang",
      regex: /\[no-retro(?: fallback="([^"]*?)")?\]([\s\S]*?)\[\/no-retro\]/g,
      replace: (_wholeMatch: string, fallbackText: string, content: string) => {
        const encodedContent = Buffer.from(content).toString("base64");
        const fallbackHtml = fallbackText ? fallbackText : "";

        return `<div class="no-retro" data-content="${encodedContent}">
  ${fallbackHtml}
</div>`;
      },
    },
  ];
});

// <script>
//   document.addEventListener('DOMContentLoaded', function () {
//     const noRetroElements = document.querySelectorAll('.no-retro');
//     noRetroElements.forEach((element: HTMLElement) => {
//       if (typeof window.atob === 'function') {
//         const encodedContent = element.getAttribute('data-content');
//         if (encodedContent) {
//           const decodedContent = window.atob(encodedContent);
//           element.innerHTML = decodedContent;
//         }
//       }
//     });
//   });
// </script>
