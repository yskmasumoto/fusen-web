import DraggableObjectManager from "./components/fusenManage";

const App: React.FC = () => {
	return (
		<div>
			<h1>ドラッグ終了時に残像が消えるドラッグ可能なオブジェクト</h1>
			<DraggableObjectManager />
		</div>
	);
};

export default App;
