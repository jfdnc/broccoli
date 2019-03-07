import { BrocfileOptions } from '../../../lib';
import Source from 'broccoli-source';
const subdir: string = 'subdir';

export default (options: BrocfileOptions) => new Source.UnwatchedDir(subdir);
