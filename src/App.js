import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState([]);


  const handleDelete = (id) => {
    const updatedMoveables = moveableComponents.filter((moveable) => moveable.id !== id);
    setMoveableComponents(updatedMoveables);
  };

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    const response = await fetch("https://jsonplaceholder.typicode.com/photos");
    const data = await response.json();
    const randomImageIndex = Math.floor(Math.random() * data.length);
    const image = data[randomImageIndex];


    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        image,
        imageFit: "cover",
        imageStyle:{
          position: "absolute",
          width:"100%",
          height: "100%",
          objectFit: "cover",
          borderRadius:"10px",
        }
      },
    ]);
    setImages([ ...images,image]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
      
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  image,
  imageFit,
  imageStyled,
  setSelected,
  isSelected = false,
  updateEnd,
  handleDelete,
}) => {

 
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  const refParent = useRef(null);

useEffect(() => {
  refParent.current = document.getElementById("parent");
}, []);


const onDrag = (e) => {
  const { top, left, width, height } = nodoReferencia;
  const { beforeTranslate } = e.drag;

  const absoluteTop = top + beforeTranslate[1];
  const absoluteLeft = left + beforeTranslate[0];

  const parentBounds = refParent.current.getBoundingClientRect();

  if (absoluteTop < 0) {
    setNodoReferencia((prevState) => ({
      ...prevState,
      top: 0,
    }));
  } else if (absoluteTop + height > parentBounds.height) {
    setNodoReferencia((prevState) => ({
      ...prevState,
      top: parentBounds.height - height,
    }));
  } else if (absoluteLeft < 0) {
    setNodoReferencia((prevState) => ({
      ...prevState,
      left: 0,
    }));
  } else if (absoluteLeft + width > parentBounds.width) {
    setNodoReferencia((prevState) => ({
      ...prevState,
      left: parentBounds.width - width,
    }));
  } else {
    setNodoReferencia((prevState) => ({
      ...prevState,
      top: absoluteTop,
      left: absoluteLeft,
    }));
  }
};


  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height){
        newHeight = parentBounds?.height - top;
    }
    if (positionMaxLeft > parentBounds?.width){
      newWidth = parentBounds?.width - left;
    }

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,  
    },true);

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    const absoluteTop = top + translateY;
    

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    const { width, height } = nodoReferencia;
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height) {
      setNodoReferencia((prevState) => ({
        ...prevState,
        height: parentBounds?.height - top,
      }));
      newHeight = parentBounds?.height - top;
    }
  
    if (positionMaxLeft > parentBounds?.width) {
      setNodoReferencia((prevState) => ({
        ...prevState,
        width: parentBounds?.width - left,
      }));
      newWidth = parentBounds?.width - left;
    }
    
    
    
   
    updateMoveable(
      id,
      {
        top ,
        left ,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
    
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      />
      <div>
      <button onClick={() => handleDelete(id)}>Eliminar</button> // Nuevo
      </div>
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    
    </>
    
  );
};