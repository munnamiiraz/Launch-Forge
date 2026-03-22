export interface PreviewPanel {
  id: string;
  eyebrow: string;
  title: string;
  titleHighlight?: string;
  description: string;
  bullets: PreviewBullet[];
  /** which side the text lives on */
  textSide: "left" | "right";
}

export interface PreviewBullet {
  icon: React.ReactNode;
  text: string;
}
