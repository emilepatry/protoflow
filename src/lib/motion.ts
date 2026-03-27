export const SPRING_QUICK = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

export const SPRING_DEFAULT = {
  type: "spring" as const,
  stiffness: 350,
  damping: 34,
  mass: 1,
};

export const SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 200,
  damping: 20,
  mass: 0.8,
};
