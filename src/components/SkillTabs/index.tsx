"use client";

import { skillTabs } from "@/mockdata";
import { SkillTabType } from "@/types/skill";
import { Box, Chip } from "@mui/material";
import dynamic from "next/dynamic";
import { useState } from "react";

const Tabs = dynamic(() => import("@mui/material/Tabs"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Tab = dynamic(() => import("@mui/material/Tab"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`skill-tabpanel-${index}`}
      aria-labelledby={`skill-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0, mt: 2 }}>{children}</Box>}
    </div>
  );
}

const SkillTabs = () => {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="w-full">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="skill tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "capitalize",
              color: "var(--color-light-secondary)",
              "&.Mui-selected": {
                color: "var(--color-light-primary)",
                fontWeight: "bold",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-light-primary)",
            },
            ".dark &": {
              "& .MuiTab-root": {
                "&.Mui-selected": {
                  color: "var(--color-dark-primary)",
                  fontWeight: "bold",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--color-dark-primary)",
              },
            },
          }}
        >
          {skillTabs.map((tab: SkillTabType, index: number) => (
            <Tab key={index} label={tab.label} disableRipple />
          ))}
        </Tabs>
      </Box>

      {skillTabs.map((tab: SkillTabType, index: number) => (
        <TabPanel key={index} value={tabValue} index={index}>
          <Box className="!flex !flex-wrap !gap-2">
            {tab.skills.map((skill, skillIndex) => (
              <Chip
                key={skillIndex}
                label={skill}
                variant="outlined"
                className="!rounded-md !bg-light-primary dark:!bg-dark-primary hover:!bg-light-primary/80 dark:hover:!bg-dark-primary/80 !cursor-pointer !text-white dark:!text-black !font-semibold !border-none [transition:none]"
                onClick={() => {}}
                clickable={false}
              />
            ))}
          </Box>
        </TabPanel>
      ))}
    </div>
  );
};

export default SkillTabs;
