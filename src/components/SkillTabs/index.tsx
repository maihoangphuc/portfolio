"use client";

import { skillTabs } from "@/mockdata";
import { SkillTab } from "@/types/skill";
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
          {skillTabs.map((tab: SkillTab, index: number) => (
            <Tab key={index} label={tab.label} disableRipple />
          ))}
        </Tabs>
      </Box>

      {skillTabs.map((tab: SkillTab, index: number) => (
        <TabPanel key={index} value={tabValue} index={index}>
          <Stack spacing={3} className="mb-6">
            <Box className="flex flex-wrap gap-2">
              {tab.skills.map((skill, skillIndex) => (
                <Chip
                  key={skillIndex}
                  label={skill}
                  variant="outlined"
                  className="!bg-primary dark:!bg-primary/80 !text-white !border-none [transition:none] hover:!bg-primary/80 dark:hover:!bg-primary"
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
