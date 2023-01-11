import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  //save all the moveable components that are created by the user
  const [moveableComponents, setMoveableComponents] = useState([]);
  //set the current moveable component that was selected
  const [selected, setSelected] = useState(null);
  //set the all the images from the fetch
  const [images, setImages] = useState([])
  // array of all options available to object fit
  const fitOptions = ['fill','contain','cover','none','scale-down']


  useEffect(() =>{
    // return and set the images
    const fetchData = async () =>{
       await fetch('https://jsonplaceholder.typicode.com/photos')
      .then(res => res.json())
      .then((data) => setImages(data.map(d => d.thumbnailUrl)))
      .catch(e => console.log(e))
    }
    
    fetchData();
    
  },[]) 

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    //add a new moveable component
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  // update the  movable's properties
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };
  // remove the movable from the list of movable components
  const removeMoveable = (id) =>{
    setMoveableComponents(components => components.filter(e => e.id !== id))
  }

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

    <h1 className="title">Challange</h1>

      <div className="editable">

        <div  
          id="parent"
          style={{
            position: "relative",
            background: "#1B2430",
            boxShadow:'0px 2px 12px 3px rgba(0, 0, 0, 0.3)',
            height: "60vh",
            width: "100%",
            overflow:'hidden',
            borderRadius:'10px'
          }}
        >
          {moveableComponents.map((item, index) => (
            <Component
              optionsImg = {fitOptions[Math.floor(Math.random() * fitOptions.length)]}
              bgImg={images[index]}
              {...item}
              key={index}
              updateMoveable={updateMoveable}
              handleResizeStart={handleResizeStart}
              setSelected={setSelected}
              isSelected={selected === item.id}
            />
          ))}
        </div>
        <button className="main-button" onClick={addMoveable}>Add Square</button>
      </div>

      <div>
          <h1 style={{textAlign:'center'}}>Elemts</h1>
          <ol>
             {moveableComponents.map((i, index) => (
              <li key={i.id} className='li-element'>
                  Element {index + 1 }
                  <button
                  onClick={ () =>  removeMoveable(i.id)}
                  className='delete-btn'
                  >
                    Delete
                  </button>
              </li>
             ))}
          </ol>
      </div>

    </main>
  );
};

export default App;

const Component = ({
  optionsImg,
  bgImg,
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  // reference to the draggable item
  const ref = useRef();
  //define the properties of the current element
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });
  //define the object Fit propertie
  const [objectFit, setObjectFit] = useState(null)

  
  useEffect(() =>{
    //if objectFit is null set the optionsImg value
    if(!objectFit) setObjectFit(optionsImg)
},[]) 
  //get the element parent
  let parent = document.getElementById("parent");
  //return the size and the relative positon of the element
  let parentBounds = parent?.getBoundingClientRect();
  
  //called when the element is resized
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;


    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };
//called when the resize is complete
  const onResizeEnd = async (e) => {

    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;


    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    /* const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;
    const absoluteTop = top - beforeTranslate[1];
    const absoluteLeft = left - beforeTranslate[0]; */

    updateMoveable(
      id,
      {
        top: top,
        left: left,
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
          borderRadius:'5px',
          overflow:'hidden',
          animationName:'popup',
          animationDuration:'0.4s',
        }}
        onClick={() => setSelected(id)}
      >

        <img src={bgImg} style={{width:width, height:height,objectFit:objectFit}} />
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        /* called when event Drag is triggered */
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
