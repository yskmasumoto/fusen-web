import type React from "react";
import { useState } from "react";
import DraggableObject from "./fusen";

const DraggableObjectManager: React.FC = () => {
	const [objects, setObjects] = useState<number[]>([]);

	const addObject = () => {
		setObjects((prevObjects) => [...prevObjects, Date.now()]);
	};

	const removeObject = (id: number) => {
		setObjects((prevObjects) => prevObjects.filter((objId) => objId !== id));
	};

	return (
		<div>
			<button onClick={addObject}>オブジェクトを追加</button>
			<p>オブジェクト数: {objects.length}</p>
			{objects.map((id) => (
				<DraggableObject key={id} onDelete={() => removeObject(id)} />
			))}
		</div>
	);
};

export default DraggableObjectManager;
