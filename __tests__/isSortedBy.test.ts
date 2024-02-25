import { isSortedBy } from "../utils/isSortedBy";

describe("isSortedBy", () => {
  test("should return true if array of objects is sorted in descending order", () => {
    const input = [{ id: 3 }, { id: 2 }, { id: 1 }];
    expect(isSortedBy(input, "id", { descending: true })).toBe(true);
  });
  test("should return false if array of objects is not sorted in descending order", () => {
    const input = [{ id: 2 }, { id: 3 }, { id: 1 }];
    expect(isSortedBy(input, "id", { descending: true })).toBe(false);
  });
  test("should return true if array of objects is sorted in ascending order", () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(isSortedBy(input, "id", { descending: false })).toBe(true);
  });
  test("should return false if array of objects is not sorted in ascending order", () => {
    const input = [{ id: 1 }, { id: 3 }, { id: 2 }];
    expect(isSortedBy(input, "id", { descending: false })).toBe(false);
  });
});
