import { err, ok, Result } from '../data/Result';


export function binary_search_by_key<T>(arr: T[], x: any, fn: (o: T) => number): Result<number, number> {

  let start = 0, end = arr.length - 1, mid, val;

  // Iterate while start not meets end
  while (start < end) {

    // Find the mid index
    mid = Math.floor((start + end) / 2);

    val = fn(arr[mid]);

    // If element is present at mid, return True
    if (val === x)
      return ok(mid);


    // Else look in left or right half accordingly
    else if (val < x)
      start = mid + 1;

    else
      end = mid - 1;
  }

  return err(get_sorted_index(arr, x, fn));
}
function get_sorted_index(arr: any[], x: any, fn: any) {
  let low = 0, high = arr.length;

  while (low < high) {
    let mid = (low + high) >>> 1;
    if (x > fn(arr[mid]))
      low = mid + 1;
    else
      high = mid;
  }

  return low;
}
