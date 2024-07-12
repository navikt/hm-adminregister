import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import arrayMove from "array-move";
import React from "react";

export default function Lmao() {
  const [items, setItems] = React.useState(["A", "B", "C"]);

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setItems((array) => arrayMove(array, oldIndex, newIndex));
  };

  return (
    <SortableList onSortEnd={onSortEnd} className="list" draggedItemClassName="dragged">
      {items.map((item) => (
        <SortableItem key={item}>
          <div className="item">
            <SortableKnob>
              <div>
                <img
                  src={
                    "http://localhost:8081/local/register/63e9335a-603a-4bd0-a79d-29a205078c4a/f74fa2bc-d333-43cb-874f-18e1b884ffaa.jpg"
                  }
                  alt={"TEST"}
                />
              </div>
            </SortableKnob>
            {item}
          </div>
        </SortableItem>
      ))}
    </SortableList>
  );
}
