import { pdf, Font } from '@react-pdf/renderer';

// Register Kannada font
Font.register({
  family: 'Baloo',
  src: 'https://fonts.gstatic.com/s/balootamma2/v2/vEFK2_hCAgcR46PaajtrYlBbd7wf8tK1W77HtMo.ttf'
});

export { pdf };
