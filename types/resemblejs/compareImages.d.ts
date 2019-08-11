declare module 'resemblejs/compareImages' {
  export = compareImages;

  interface Options {}

  interface ResembleComparisonResult {
    misMatchPercentage: string;
    getBuffer(): Buffer;
  }

  function compareImages(
    image1: Buffer,
    image2: Buffer,
    options?: Options,
  ): Promise<ResembleComparisonResult>;
}
