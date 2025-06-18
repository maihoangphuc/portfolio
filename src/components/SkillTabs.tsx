"use client";

import { SKILL_TABS } from "@/constants";
import { Box, Stack, Tabs, Tab, Chip } from "@mui/material";
import { useState } from "react";

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-primary)",
            },
            "& .MuiTab-root": {
              color: "text.secondary",
              textTransform: "capitalize",
              "&.Mui-selected": {
                color: "var(--color-primary)",
              },
            },
          }}
        >
          {SKILL_TABS.map((tab, index) => (
            <Tab key={index} label={tab.label} disableRipple />
          ))}
        </Tabs>
      </Box>

      {SKILL_TABS.map((tab, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          <Stack spacing={3} className="mb-6">
            <Box className="flex flex-wrap gap-2">
              {tab.skills.map((skill, skillIndex) => (
                <Chip
                  key={skillIndex}
                  label={skill}
                  variant="outlined"
                  className="bg-blue-50 dark:bg-slate-800 border-none [transition:none] hover:bg-blue-100 dark:hover:bg-slate-700"
                  onClick={() => {}}
                  clickable={false}
                />
              ))}
            </Box>
          </Stack>
        </TabPanel>
      ))}
    </div>
  );
};

export default SkillTabs;
