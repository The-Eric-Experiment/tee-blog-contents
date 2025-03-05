import { extension } from "showdown";
import { parse } from "yaml";
import { v5 } from "uuid";

type MusicItem = {
  url: string;
  title: string;
  artist: string;
  duration: number;
  id: string;
  description?: string;
};

extension("music", () => {
  return [
    {
      type: "lang",
      regex: /\[music\]([\s\S]*?)\[\/music\]/g,
      replace: (_wholeMatch: string, content: string) => {
        const parsed: MusicItem[] = parse(content).map(
          (item: Omit<MusicItem, "id">) => ({
            ...item,
            id: v5(item.url, v5.URL),
          })
        );

        return /*html*/ `
<?php
  $songs = [
  ${parsed
    .map(
      (item) =>
        `  "${item.id}" => [${Object.entries(item)
          .map(([key, value]) => `"${key}" => "${value}"`)
          .join(",")}]`
    )
    .join(",\n  ")}
  ];

  if (isset($_GET['play']) && isset($songs[$_GET['play']])) {
    $metadata = $songs[$_GET['play']];
?>
<h3>Playing:</h3>
<p><?= $metadata['artist'] ?> - <?= $metadata['title'] ?></p>
<embed src="<?= htmlspecialchars($metadata['url']) ?>" type="audio/x-pn-realaudio-plugin"
       autostart="true" width="320" height="30"
       controls="ControlPanel" name="royal" console="$metadata['id']">
<br>
<embed type="audio/x-pn-realaudio-plugin"
       width="320" height="20"
       controls="StatusBar" name="royal" console="$metadata['id']">
<br>
<br>
<?php
}
?>

<table class="music-playlist" cellpadding="0" cellspacing="4" border="0" width="600">
${parsed
  .map((item) =>
    /*html*/ `
  <tr data-title="${item.title}" data-artist="${item.artist}" data-url="${
      item.url
    }" data-duration="${item.duration}">
    <td width="25">
      <img src="/contents/public/speaker.gif" alt="Song">
    </td>
    <td>
      <font size="4"><b>${item.title} - ${item.artist}</b></font>
    </td>
    <td width="28" align="right">
      <a href="/music?play=${item.id}">
        <img src="/contents/public/play.gif" alt="Play" border="0">
      </a>
    </td>
  </tr>
  ${
    item.description
      ? /*html*/ `<tr><td colspan="3">${item.description}</td></tr>`
      : ""
  }
`.trim()
  )
  .join("\n")}
</table>`.trim();
      },
    },
  ];
});
