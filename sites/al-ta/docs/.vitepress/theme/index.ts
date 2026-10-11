// テーマ本体（ドリル部品・共通 CSS・計測）は全サイト共通の packages/shared にある。
// このサイトはブランドカラー（深緑・ティール系）だけを al-ta.css で上書きする。
// import の順序で CSS の読み込み順が決まるため、共通テーマの re-export を先に書く。
export { default } from "@jstqb/shared/theme";
import "./al-ta.css";
