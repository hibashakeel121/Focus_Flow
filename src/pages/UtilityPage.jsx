import Card from '../components/common/Card';
import WordCounter from '../components/utilities/WordCounter';
import Calculator from '../components/utilities/Calculator'; // Check this import

export default function UtilityPage() {
  return (
    <Card title="Utilities">
      <WordCounter />
      <hr className="my-6 border-gray-200 dark:border-gray-700" />
      <Calculator /> {/* Make sure this line says <Calculator /> instead of <WordCounter /> */}
    </Card>
  );
}