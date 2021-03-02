// @flow

import React, { useEffect, useState, useRef } from "react";
import ReactNative, {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SketchCanvas from "./src/SketchCanvas";
import { requestPermissions } from "./src/handlePermissions";
import { STROKE_COLORS } from "./src/constants";
import type { RNCanvasProps as Props } from "./src/types";

export default function RNSketchCanvas({
  alphaValues = ["33", "77", "AA", "FF"],
  defaultStrokeIndex = 0,
  defaultStrokeWidth = 3,
  localSourceImage = null,
  maxStrokeWidth = 15,
  minStrokeWidth = 3,
  permissionDialogMessage = "",
  permissionDialogTitle = "",
  savePreference = null,
  strokeColors = STROKE_COLORS,
  strokeWidthStep: strokeWidthStepProp = 3,
  text = null,
  user = null,

  canvasStyle = null,
  containerStyle = null,

  clearComponent: ClearComponent = null,
  closeComponent: CloseComponent = null,
  eraseComponent: EraseComponent = null,
  saveComponent: SaveComponent = null,
  strokeComponent: StrokeComponent = null,
  strokeSelectedComponent: StrokeSelectedComponent = null,
  strokeWidthComponent: StrokeWidthComponent = null,
  undoComponent: UndoComponent = null,

  onClearPressed,
  onClosePressed,
  onPathsChange,
  onStrokeStart,
  onStrokeChanged,
  onStrokeEnd,
  onSketchSaved,
  onUndoPressed,
}: Props): React$Element<*> {
  const [alpha, setAlpha] = useState(alphaValues[3]);
  const [alphaStep, setAlphaStep] = useState(-1);
  const [color, setColor] = useState(strokeColors[defaultStrokeIndex].color);
  const [colorChanged, setColorChanged] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(defaultStrokeWidth);
  const [strokeWidthStep, setStrokeWidthStep] = useState(strokeWidthStepProp);
  const [hasFilePermissions, setHasFilePermissions] = useState(false);
  const sketchCanvasRef = useRef();

  function clear() {
    sketchCanvasRef.current?.clear();
  }
  function undo() {
    return sketchCanvasRef.current?.undo() || -1;
  }
  function addPath(data) {
    sketchCanvasRef.current?.addPath(data);
  }
  function deletePath(id) {
    sketchCanvasRef.current?.deletePath(id);
  }
  function getFileName() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${(
      "0" + date.getDate()
    ).slice(-2)} ${("0" + date.getHours()).slice(-2)}-${(
      "0" + date.getMinutes()
    ).slice(-2)}-
${("0" + date.getSeconds()).slice(-2)}`;
  }

  function save() {
    if (savePreference) {
      const p = savePreference();
      sketchCanvasRef.current?.save(
        p.imageType,
        p.transparent,
        p.folder ? p.folder : "",
        p.filename,
        p.includeImage !== false,
        p.includeText !== false,
        p.cropToImageSize || false
      );
    } else {
      sketchCanvasRef.current?.save(
        "png",
        false,
        "",
        getFileName(),
        true,
        true,
        false
      );
    }
  }

  function nextStrokeWidth() {
    setStrokeWidth((prev) => {
      const prevSize = typeof prev === "number" ? prev : 1;
      const newSize =
        prevSize + strokeWidthStep >= maxStrokeWidth
          ? 1
          : prevSize + strokeWidthStep;
      setStrokeWidth(newSize);
      return newSize;
    });
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={{ marginHorizontal: 2.5 }}
      onPress={() => {
        if (color === item.color) {
          const index = alphaValues.indexOf(alpha);
          if (alphaStep < 0) {
            const step = index === 0 ? 1 : -1;
            setAlphaStep(step);
            setAlpha(alphaValues[index + step]);
          } else {
            const step = index === alphaValues.length - 1 ? -1 : 1;
            setAlphaStep(step);
            setAlpha(alphaValues[index + step]);
          }
        } else {
          setColor(item.color);
          setColorChanged(true);
        }
      }}
    >
      {color !== item.color && StrokeComponent && (
        <StrokeComponent color={item.color} />
      )}

      {color === item.color && StrokeSelectedComponent && (
        <StrokeSelectedComponent
          color={item.color + alpha}
          index={index}
          colorChanged={colorChanged}
        />
      )}
    </TouchableOpacity>
  );

  useEffect(() => {
    if (!hasFilePermissions) {
      requestPermissions(
        permissionDialogTitle,
        permissionDialogMessage
      ).then((granted) => setHasFilePermissions(granted));
    }
  }, []);

  useEffect(() => {
    setColorChanged(false);
  });

  return (
    <View style={containerStyle}>
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "flex-start",
          }}
        >
          {CloseComponent && (
            <TouchableOpacity onPress={onClosePressed}>
              <CloseComponent />
            </TouchableOpacity>
          )}

          {EraseComponent && (
            <TouchableOpacity onPress={() => setColor("#00000000")}>
              <EraseComponent />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {StrokeWidthComponent && (
            <TouchableOpacity onPress={nextStrokeWidth}>
              <StrokeWidthComponent strokeWidth={strokeWidth} />
            </TouchableOpacity>
          )}
          {UndoComponent && (
            <TouchableOpacity onPress={() => onUndoPressed?.(undo())}>
              <UndoComponent />
            </TouchableOpacity>
          )}
          {ClearComponent && (
            <TouchableOpacity
              onPress={() => {
                clear();
                onClearPressed?.();
              }}
            >
              <ClearComponent />
            </TouchableOpacity>
          )}

          {SaveComponent && (
            <TouchableOpacity onPress={save}>
              <SaveComponent />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <SketchCanvas
        ref={sketchCanvasRef}
        style={canvasStyle}
        strokeColor={`${color}${color.length === 9 ? "" : alpha}`}
        onStrokeStart={onStrokeStart}
        onStrokeChanged={onStrokeChanged}
        onStrokeEnd={onStrokeEnd}
        user={user}
        strokeWidth={strokeWidth}
        onSketchSaved={(success, path) => onSketchSaved?.(success, path)}
        onPathsChange={onPathsChange}
        text={text}
        localSourceImage={localSourceImage}
        permissionDialogTitle={permissionDialogTitle}
        permissionDialogMessage={permissionDialogMessage}
      />
      <View style={{ flexDirection: "row" }}>
        <FlatList
          data={strokeColors}
          extraData={{ alpha, color, strokeWidth }}
          keyExtractor={() => Math.ceil(Math.random() * 10000000).toString()}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

// $FlowFixMe
RNSketchCanvas.MAIN_BUNDLE = SketchCanvas.MAIN_BUNDLE;
// $FlowFixMe
RNSketchCanvas.DOCUMENT = SketchCanvas.DOCUMENT;
// $FlowFixMe
RNSketchCanvas.LIBRARY = SketchCanvas.LIBRARY;
// $FlowFixMe
RNSketchCanvas.CACHES = SketchCanvas.CACHES;

export { SketchCanvas };
