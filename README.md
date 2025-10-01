# Etmucis

半成品

一个简易支持卡拉ok的字幕音乐播放器

### 在你的网站内使用

在网站内引用JS

```html
<script src="player.js"></script>
```

你需要确保你的网站包含以下css

```css
.text span {
    display: inline-block;
    background: linear-gradient(to right, #000000 var(--progress, 0%), #818282 var(--progress, 0%));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    transition: --progress 0.1s ease;
	white-space: normal;
}
/*#000000与#818282分别是播放完与未播放的文字颜色*/
```

html

audio标签示例格式

```html
<audio id="audio" src="你的音乐文件路径" controls="" lyricpath="你的json歌词文件路径"></audio>
```

你需要在需要显示歌词的html文字标签使用id：lyric

副歌词（双语歌词）使用id：pairlyric

如果你想要实现频谱条效果，可以在创建canvas
```html
<canvas id="spectrum" width="800" height="300"></canvas>
```
