import { motion } from "framer-motion";

interface UnderlineIconProps {
  className?: string;
}

const UnderlineIcon = ({ className }: UnderlineIconProps) => {
  return (
    <svg
      width="37"
      height="8"
      viewBox="0 0 37 8"
      fill="none"
      className={className}
    >
      <motion.path
        d="M1 4.5C6 4.5 5.5 1.5 9 4.5C12.5 7.5 14 1.5 18.5 4.5C23 7.5 24 1.5 28 4.5C32 7.5 31.5 4.5 36 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{
          strokeDasharray: 84.20591735839844,
          strokeDashoffset: 84.20591735839844,
        }}
        animate={{
          strokeDashoffset: 0,
        }}
        transition={{
          duration: 1,
        }}
      />
    </svg>
  );
};

export default UnderlineIcon;
