// @flow
type ImageType = "png" | "jpg";

type StrokeColor = {| color: string |};

type Size = {|
  height: number,
  width: number,
|};

type LocalSourceImage = {|
  directory?: string,
  filename?: string,
  mode?: "AspectFill" | "AspectFit" | "ScaleToFill",
|};

type Path = {|
  path: PathData,
  size: Size,
  drawer?: string,
|};

type PathData = {|
  color: string,
  data: Array<string>,
  id: number,
  width: number,
|};

type SavePreference = {|
  filename: string,
  folder: string,
  imageType: ImageType,
  transparent: boolean,
  cropToImageSize?: boolean,
  includeImage?: boolean,
  includeText?: boolean,
|};

export type RNCanvasProps = {|
  containerStyle?: *,
  canvasStyle?: *,

  clearComponent?: (any) => React$Element<*>,
  closeComponent?: (any) => React$Element<*>,
  eraseComponent?: (any) => React$Element<*>,
  saveComponent?: (any) => React$Element<*>,
  strokeComponent?: (any) => React$Element<*>,
  strokeSelectedComponent?: (any) => React$Element<*>,
  strokeWidthComponent?: (any) => React$Element<*>,
  undoComponent?: (any) => React$Element<*>,

  onClearPressed?: () => void,
  onClosePressed?: () => void,
  onPathsChange?: (number) => void,
  onSketchSaved?: (boolean, string) => void,
  onStrokeChanged?: () => void,
  onStrokeEnd?: (Path) => void,
  onStrokeStart?: () => void,
  onUndoPressed?: (number) => void,

  alphaValues: Array<string>,
  maxStrokeWidth?: number,
  defaultStrokeIndex?: number,
  defaultStrokeWidth?: number,
  localSourceImage?: LocalSourceImage,
  minStrokeWidth?: number,
  permissionDialogMessage?: string,
  permissionDialogTitle?: string,
  strokeColors?: Array<StrokeColor>,
  strokeWidthStep?: number,
  savePreference?: () => SavePreference,
  text?: Array<CanvasText>,
  user?: string,
|};

type Coordinate = { x: number, y: number };

type CanvasText = {|
  anchor: Coordinate,
  position: Coordinate,
  text: string,
  coordinate?: "Absolute" | "Ratio",
  alignment?: "Left" | "Center" | "Right",
  font?: string,
  fontSize?: number,
  fontColor?: string,
  lineHeightMultiple?: number,
  overlay?: "TextOnSketch" | "SketchOnText",
|};

export type SketchCanvasProps = {|
  onPathsChange?: (number) => void,
  onSketchSaved?: (boolean, string) => void,
  onStrokeChanged?: () => void,
  onStrokeEnd?: (Path) => void,
  onStrokeStart?: () => void,

  localSourceImage?: LocalSourceImage,
  permissionDialogMessage?: string,
  permissionDialogTitle?: string,
  strokeColor?: string,
  strokeWidth?: number,
  style?: *,
  text?: Array<CanvasText>,
  touchEnabled?: boolean,
  user?: string,
|};
