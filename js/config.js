/**
 * 공개해도 되는 값만. (비밀/토큰은 GAS Script Properties)
 * 배포 GAS Web App URL — 끝에 /exec 를 쓰는지 프로젝트에 맞게.
 */
export const GAS_BASE_URL = '';

export const GAS_MODE = {
  useMock: !GAS_BASE_URL,
};
