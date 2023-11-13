export const fetchPack = async ({ link }) => {
  return fetch(link, {
    method: "get",
  }).then(res => res.json())
}