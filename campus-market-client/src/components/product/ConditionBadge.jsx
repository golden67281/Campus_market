import Badge from '../ui/Badge';

const colorMap = { New: 'green', 'Like New': 'blue', Good: 'yellow', Fair: 'gray' };

export default function ConditionBadge({ condition }) {
  return <Badge color={colorMap[condition] || 'gray'}>{condition}</Badge>;
}
