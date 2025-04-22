// No global jest-dom setup. Each test file should import and extend expect as needed.
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
