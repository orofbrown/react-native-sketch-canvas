// @flow
import React, { useEffect, useRef, useState } from 'react';
import {
  NativeModules,
  PanResponder,
  PixelRatio,
  Platform,
  UIManager,
  processColor,
  requireNativeComponent,
} from 'react-native';
import { requestPermissions } from './handlePermissions';
import type { SketchCanvasProps as Props } from './types';

const RNSketchCanvas = requireNativeComponent('RNSketchCanvas');
const SketchCanvasManager = NativeModules.RNSketchCanvasManager || {};

function SketchCanvas({
  style = null,

  onPathsChange = () => {},
  onStrokeChanged = () => {},
  onStrokeEnd = () => {},
  onStrokeStart = () => {},
  onSketchSaved = () => {},

  localSourceImage = null,
  permissionDialogTitle = '',
  permissionDialogMessage = '',
  strokeColor = '#000',
  strokeWidth = 3,
  text: textProp = null,
  touchEnabled = true,
  user = null,
}: Props): React$Element<*> {
  const [initialized, setInitialized] = useState(false);
  const [linePath, setLinePath] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [paths, setPaths] = useState([]);
  const [pathsToProcess, setPathsToProcess] = useState([]);
  const [screenScale, setScreenScale] = useState(
    Platform.select({ android: PixelRatio.get(), ios: 1 }),
  );
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [text, setText] = useState(
    processText(textProp ? textProp.map((t) => Object.assign({}, t)) : null),
  );
  const canvasRef = useRef();

  // componentWillReceiveProps(nextProps) {
  //   this.setState({
  //     text: this._processText(
  //       nextProps.text ? nextProps.text.map((t) => Object.assign({}, t)) : null
  //     ),
  //   });
  // }

  function clear() {
    setPaths([]);
    setLinePath(null);
    UIManager.dispatchViewManagerCommand(
      canvasRef.current,
      // $FlowFixMe
      UIManager.RNSketchCanvas.Commands.clear,
      [],
    );
  }

  function processText(text) {
    text && text.forEach((t) => (t.fontColor = processColor(t.fontColor)));
    return text;
  }

  function undo() {
    let lastId = -1;
    paths.forEach(
      (d) => (lastId = d.drawer === this.props.user ? d.path.id : lastId),
    );
    if (lastId >= 0) this.deletePath(lastId);
    return lastId;
  }

  function addPath(data) {
    if (this._initialized) {
      if (paths.filter((p) => p.path.id === data.path.id).length === 0)
        paths.push(data);
      const pathData = data.path.data.map((p) => {
        const coor = p.split(',').map((pp) => parseFloat(pp).toFixed(2));
        return `${
          (coor[0] * screenScale * this._size.width) / data.size.width
        },${(coor[1] * screenScale * this._size.height) / data.size.height}`;
      });
      UIManager.dispatchViewManagerCommand(
        canvasRef.current,
        // $FlowFixMe
        UIManager.RNSketchCanvas.Commands.addPath,
        [
          data.path.id,
          processColor(data.path.color),
          data.path.width * screenScale,
          pathData,
        ],
      );
    } else {
      pathsToProcess.filter((p) => p.path.id === data.path.id).length === 0 &&
        pathsToProcess.push(data);
    }
  }

  function deletePath(id) {
    setPaths((prev) => prev.filter((p) => p.path.id !== id));
    UIManager.dispatchViewManagerCommand(
      canvasRef.current,
      // $FlowFixMe
      UIManager.RNSketchCanvas.Commands.deletePath,
      [id],
    );
  }

  function save(
    imageType,
    transparent,
    folder,
    filename,
    includeImage,
    includeText,
    cropToImageSize,
  ) {
    UIManager.dispatchViewManagerCommand(
      canvasRef.current,
      // $FlowFixMe
      UIManager.RNSketchCanvas.Commands.save,
      [
        imageType,
        folder,
        filename,
        transparent,
        includeImage,
        includeText,
        cropToImageSize,
      ],
    );
  }

  function getPaths() {
    return paths;
  }

  function getBase64(
    imageType,
    transparent,
    includeImage,
    includeText,
    cropToImageSize,
    callback,
  ) {
    if (Platform.OS === 'ios') {
      SketchCanvasManager.transferToBase64(
        canvasRef,
        imageType,
        transparent,
        includeImage,
        includeText,
        cropToImageSize,
        callback,
      );
    } else {
      NativeModules.SketchCanvasModule.transferToBase64(
        canvasRef,
        imageType,
        transparent,
        includeImage,
        includeText,
        cropToImageSize,
        callback,
      );
    }
  }

  // componentWillMount() {
  //   this.panResponder = PanResponder.create({
  //     // Ask to be the responder:
  //     onStartShouldSetPanResponder: (evt, gestureState) => true,
  //     onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
  //     onMoveShouldSetPanResponder: (evt, gestureState) => true,
  //     onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

  //     onPanResponderGrant: (evt, gestureState) => {
  //       if (!this.props.touchEnabled) return;
  //       const e = evt.nativeEvent;
  //       offset = { x: e.pageX - e.locationX, y: e.pageY - e.locationY };
  //       linePath = {
  //         id: parseInt(Math.random() * 100000000),
  //         color: this.props.strokeColor,
  //         width: this.props.strokeWidth,
  //         data: [],
  //       };

  //       UIManager.dispatchViewManagerCommand(
  //         canvasRef,
  //         UIManager.RNSketchCanvas.Commands.newPath,
  //         [
  //           linePath.id,
  //           processColor(linePath.color),
  //           linePath.width * screenScale,
  //         ]
  //       );
  //       UIManager.dispatchViewManagerCommand(
  //         canvasRef,
  //         UIManager.RNSketchCanvas.Commands.addPoint,
  //         [
  //           parseFloat(
  //             (gestureState.x0 - offset.x).toFixed(2) * screenScale
  //           ),
  //           parseFloat(
  //             (gestureState.y0 - offset.y).toFixed(2) * screenScale
  //           ),
  //         ]
  //       );
  //       const x = parseFloat((gestureState.x0 - offset.x).toFixed(2)),
  //         y = parseFloat((gestureState.y0 - offset.y).toFixed(2));
  //       linePath.data.push(`${x},${y}`);
  //       this.props.onStrokeStart(x, y);
  //     },
  //     onPanResponderMove: (evt, gestureState) => {
  //       if (!this.props.touchEnabled) return;
  //       if (linePath) {
  //         UIManager.dispatchViewManagerCommand(
  //           canvasRef,
  //           UIManager.RNSketchCanvas.Commands.addPoint,
  //           [
  //             parseFloat(
  //               (gestureState.moveX - offset.x).toFixed(2) *
  //                 screenScale
  //             ),
  //             parseFloat(
  //               (gestureState.moveY - offset.y).toFixed(2) *
  //                 screenScale
  //             ),
  //           ]
  //         );
  //         const x = parseFloat(
  //             (gestureState.moveX - offset.x).toFixed(2)
  //           ),
  //           y = parseFloat((gestureState.moveY - offset.y).toFixed(2));
  //         linePath.data.push(`${x},${y}`);
  //         this.props.onStrokeChanged(x, y);
  //       }
  //     },
  //     onPanResponderRelease: (evt, gestureState) => {
  //       if (!this.props.touchEnabled) return;
  //       if (linePath) {
  //         this.props.onStrokeEnd({
  //           path: linePath,
  //           size: this._size,
  //           drawer: this.props.user,
  //         });
  //         paths.push({
  //           path: linePath,
  //           size: this._size,
  //           drawer: this.props.user,
  //         });
  //       }
  //       UIManager.dispatchViewManagerCommand(
  //         canvasRef,
  //         UIManager.RNSketchCanvas.Commands.endPath,
  //         []
  //       );
  //     },

  //     onShouldBlockNativeResponder: (evt, gestureState) => {
  //       return true;
  //     },
  //   });
  // }

  // async componentDidMount() {
  //   const isStoragePermissionAuthorized = await requestPermissions(
  //     this.props.permissionDialogTitle,
  //     this.props.permissionDialogMessage
  //   );
  // }

  return (
    <RNSketchCanvas
      ref={canvasRef}
      style={this.props.style}
      onLayout={(e) => {
        this._size = {
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        };
        this._initialized = true;
        pathsToProcess.length > 0 &&
          pathsToProcess.forEach((p) => this.addPath(p));
      }}
      {...this.panResponder.pancanvasRefrs}
      onChange={(e) => {
        if (e.nativeEvent.hasOwnProperty('pathsUpdate')) {
          this.props.onPathsChange(e.nativeEvent.pathsUpdate);
        } else if (
          e.nativeEvent.hasOwnProperty('success') &&
          e.nativeEvent.hasOwnProperty('path')
        ) {
          this.props.onSketchSaved(e.nativeEvent.success, e.nativeEvent.path);
        } else if (e.nativeEvent.hasOwnProperty('success')) {
          this.props.onSketchSaved(e.nativeEvent.success);
        }
      }}
      localSourceImage={this.props.localSourceImage}
      permissionDialogTitle={this.props.permissionDialogTitle}
      permissionDialogMessage={this.props.permissionDialogMessage}
      text={this.state.text}
    />
  );
}

if (Platform.OS == 'ios') {
  // $FlowFixMe
  SketchCanvas.MAIN_BUNDLE = UIManager.RNSketchCanvas.Constants.MainBundlePath;
  SketchCanvas.DOCUMENT =
    // $FlowFixMe
    UIManager.RNSketchCanvas.Constants.NSDocumentDirectory;
  // $FlowFixMe
  SketchCanvas.LIBRARY = UIManager.RNSketchCanvas.Constants.NSLibraryDirectory;
  // $FlowFixMe
  SketchCanvas.CACHES = UIManager.RNSketchCanvas.Constants.NSCachesDirectory;
}

export default SketchCanvas;
