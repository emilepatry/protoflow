import type { ComponentVariant } from "@/types";
import Button from "./component";

export const variants: ComponentVariant[] = [
  {
    id: "primary",
    name: "Primary",
    description: "Default primary action button",
    render: () => <Button variant="primary">Add to Cart</Button>,
  },
  {
    id: "secondary",
    name: "Secondary",
    description: "Secondary action with border",
    render: () => <Button variant="secondary">View Details</Button>,
  },
  {
    id: "destructive",
    name: "Destructive",
    description: "Destructive / danger action",
    render: () => <Button variant="destructive">Remove Item</Button>,
  },
  {
    id: "ghost",
    name: "Ghost",
    description: "Minimal ghost button for tertiary actions",
    render: () => <Button variant="ghost">Cancel</Button>,
  },
  {
    id: "disabled",
    name: "Disabled",
    description: "Disabled state across variants",
    render: () => (
      <div className="flex gap-3">
        <Button variant="primary" disabled>Primary</Button>
        <Button variant="secondary" disabled>Secondary</Button>
      </div>
    ),
  },
  {
    id: "sizes",
    name: "Sizes",
    description: "Small, medium, and large sizes",
    render: () => (
      <div className="flex items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    ),
  },
];
