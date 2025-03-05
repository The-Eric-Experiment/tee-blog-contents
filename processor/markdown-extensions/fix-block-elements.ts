import { extension } from "showdown";

extension("fix-block-elements", function () {
  return [
    {
      type: "listener",
      listeners: {
        "hashHTMLBlocks.after": function (
          event,
          text,
          converter,
          options,
          globals
        ) {
          // Capture only block-level elements (ensuring full blocks are recognized)
          text = text.replace(
            /^\s*<(object|embed|video|audio|iframe|table|tr|td|th|center)\b[^>]*>[\s\S]*?<\/\1>$/gim,
            function (wm) {
              return "\n\n¨K" + (globals.gHtmlBlocks.push(wm) - 1) + "K\n\n";
            }
          );

          // Ensure self-closing block elements (like <embed>, <img>, etc.) remain untouched
          text = text.replace(
            /^\s*<(embed|source|meta|link|br|hr|input|img|param)\b[^>]*\/?>$/gim,
            function (wm) {
              return "\n\n¨K" + (globals.gHtmlBlocks.push(wm) - 1) + "K\n\n";
            }
          );

          // Capture **closing** block tags to prevent wrapping in <p> (NEW FIX)
          text = text.replace(
            /^\s*<\/(object|embed|video|audio|iframe|table|tr|td|th|center)>/gim,
            function (wm) {
              return "¨K" + (globals.gHtmlBlocks.push(wm) - 1) + "K";
            }
          );

          return text;
        },
      },
    },
  ];
});
