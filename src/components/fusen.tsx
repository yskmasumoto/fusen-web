import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Position {
	x: number;
	y: number;
}

interface DraggableObjectProps {
	onDelete: () => void;
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ onDelete }) => {
	const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [trail, setTrail] = useState<Position[]>([]);
	const [isTrailVisible, setIsTrailVisible] = useState<boolean>(true);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (!isDragging || !ref.current) return;
			const newX = event.clientX - ref.current.offsetWidth / 2;
			const newY = event.clientY - ref.current.offsetHeight / 2;
			const newPosition: Position = { x: newX, y: newY };
			setPosition(newPosition);

			setTrail((prevTrail) => [...prevTrail, newPosition].slice(-10));
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsTrailVisible(false);
			setTimeout(() => setTrail([]), 300);
		};

		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging]);

	const handleMouseDown = () => {
		setIsDragging(true);
		setIsTrailVisible(true);
		setTrail([]);
	};

	return (
		<>
			{isTrailVisible &&
				trail.map((pos, index) => (
					<div
						key={index}
						style={{
							position: "absolute",
							left: `${pos.x}px`,
							top: `${pos.y}px`,
							width: "200px",
							height: "140px",
							backgroundColor: "rgba(0, 0, 255, 0.2)",
							pointerEvents: "none",
							transition: "opacity 0.3s",
							opacity: (index + 1) / trail.length,
						}}
					/>
				))}
			<div
				ref={ref}
				style={{
					position: "absolute",
					left: `${position.x}px`,
					top: `${position.y}px`,
					width: "200px",
					height: "100px",
					zIndex: 1,
					transition: "box-shadow 0.3s, transform 0.3s",
					borderRadius: "10px",
					boxShadow: isDragging
						? "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)"
						: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
					transform: isDragging ? "scale(1.05)" : "scale(1)",
				}}
			>
				<div
					style={{
						backgroundColor: "#808080",
						padding: "10px",
						display: "flex",
						height: "20px",
						justifyContent: "flex-end",
						alignItems: "center",
						cursor: isDragging ? "grabbing" : "grab",
					}}
					onMouseDown={handleMouseDown}
				>
					<button
						onClick={onDelete}
						style={{
							background: "red",
							color: "white",
							border: "none",
							borderRadius: "50%",
							width: "20px",
							height: "20px",
							fontSize: "12px",
							cursor: "pointer",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							padding: 0, // パディングを削除
							lineHeight: 1, // 行の高さを調整
							boxSizing: "border-box", // ボックスモデルを調整
							overflow: "hidden", // はみ出す内容を隠す
						}}
					>
						✕
					</button>
				</div>
				<div
					contentEditable
					style={{
						width: "200px",
						height: "100px",
						backgroundColor: "blue",
					}}
				>
					ドラッグして動かせます
				</div>
			</div>
		</>
	);
};

export default DraggableObject;
