import { Icon } from "../Icon";

export interface TrustItem {
  icon?: string;
  text: string;
}

interface TrustBarProps {
  items: TrustItem[];
}

export function TrustBar({ items }: TrustBarProps) {
  return (
    <div className="trustbar section-deep">
      <ul className="site-shell trustbar-row">
        {items.map((item) => (
          <li key={item.text} className="trustbar-item">
            <Icon name={item.icon ?? "shield"} size={18} />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
