export {};

declare global {
  interface Window {
    TradingView: {
      widget: new (config: TradingViewWidgetConfig) => TradingViewWidgetInstance;
    };
  }
}

interface TradingViewWidgetConfig {
  width: number | string;
  height: number | string;
  symbol: string;
  interval: string;
  theme: string;
  style: string;
  locale: string;
  toolbar_bg: string;
  enable_publishing: boolean;
  hide_top_toolbar: boolean;
  hide_legend?: boolean;
  container_id: string;
  overrides?: Record<string, string>;
  studies?: string[];
  allow_symbol_change?: boolean;
  save_image?: boolean;
}

interface TradingViewWidgetInstance {
  remove?: () => void;
}
