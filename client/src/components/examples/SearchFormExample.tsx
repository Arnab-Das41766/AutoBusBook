import SearchForm from "../SearchForm";

export default function SearchFormExample() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <SearchForm
        onSearch={(data) => console.log("Search:", data)}
      />
    </div>
  );
}
