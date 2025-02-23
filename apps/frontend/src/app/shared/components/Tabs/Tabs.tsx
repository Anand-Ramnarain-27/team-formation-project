import React from 'react';
import styles from './Tabs.module.css';

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

const Tabs = ({ tabs, activeTab, onTabChange, className }: TabsProps) => {
  return (
    <nav
      className={`${styles.tabsContainer} ${className || ''}`}
      role="tablist"
      aria-label="Content tabs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          className={`${styles.tab} ${
            activeTab === tab.id ? styles.activeTab : ''
          }`}
          onClick={() => onTabChange(tab.id)}
          tabIndex={activeTab === tab.id ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
