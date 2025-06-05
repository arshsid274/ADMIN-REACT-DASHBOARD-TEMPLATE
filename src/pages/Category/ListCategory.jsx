import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import noimg from "../../assets/noimg.png";
import SlideToggle from "../toggle/SlideToggle";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

// const staticCategoryData = [
//   {
//     _id: "1",
//     alt: "Category 1",
//     url: "https://example.com/images/category1.jpg",
//     status: true,
//   },
//   {
//     _id: "2",
//     alt: "Category 2",
//     url: "https://example.com/images/category2.jpg",
//     status: false,
//   },
//   {
//     _id: "3",
//     alt: "Category 3",
//     url: "https://example.com/images/category3.jpg",
//     status: true,
//   },
// ];

const ListCategory = () => {
  const tableRef = useRef(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const itemsPerPage = 10; // Adjust as needed

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API delay
     
        const response = await axios.get("https://bcakend-banquet.vercel.app/api/getAllCategory");
        const data = response.data;
        setUserData(data);
        setTotalPages(math.ceil(data.length / itemsPerPage));
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handleToggleStatus = (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      const updatedData = userData.map((user) =>
        user._id === id ? { ...user, status: updatedStatus } : user
      );
      setUserData(updatedData);
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleDelete = (id) => {
    setLoading(true);
    try {
      const updatedData = userData.filter((user) => user._id !== id);
      setUserData(updatedData);
      setTotalPages(Math.ceil(updatedData.length / itemsPerPage));
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete === "delete-all") {
      setUserData([]);
      setTotalPages(1);
      toast.success("All categories deleted");
    } else {
      handleDelete(productToDelete._id);
    }
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      fetchUsers();
    } else {
      const filtered = staticCategoryData.filter((user) =>
        user.alt.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUserData(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => (
    <nav className="mt-12 flex justify-center">
      <ul className="join">
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 cursor-pointer mx-1 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li key={page}>
            <button
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 mx-1 ${
                currentPage === page ? "bg-gray-400 text-white" : ""
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 cursor-pointer mx-1 bg-black text-white disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );

  const handleDownloadCSV = () => {
    const table = tableRef.current;
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tr"));
    const csvData = rows
      .map((row) =>
        Array.from(row.querySelectorAll("th, td"))
          .map((cell) => `"${cell.innerText.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Category-Detail.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Toaster />
      <div className="flex justify-between items-center">
        <button
          onClick={handleDownloadCSV}
          className="btn btn-success text-white"
        >
          Download CSV
        </button>
        <Link
          to={"/addcategory"}
          className="btn text-white bg-gradient-to-r from-[#5e0d14] to-[#991e1e]"
        >
          +Add Category
        </Link>
      </div>
      <div className="form-control relative top-6 overflow-visible">
        <input
          className="input input-bordered w-full focus:text-black placeholder:text-gray-400 border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-[#991e1e]"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search By Category Name"
        />
        {searchQuery && (
          <span
            onClick={() => {
              setSearchQuery("");
              fetchUsers();
            }}
            className="cursor-pointer bg-red-600 text-white px-2 py-1 rounded-full absolute right-3 top-1/2 -translate-y-1/2 z-10"
          >
            x
          </span>
        )}
      </div>
      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        {!loading ? (
          <>
            {userData && userData.length > 0 ? (
              <table ref={tableRef} className="w-full table-auto text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                  <tr>
                    <th className="py-3 px-6">Category Name</th>
                    <th className="py-3 px-6">Action</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 divide-y">
                  {userData.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img src={item.url || noimg} alt="category" />
                            </div>
                          </div> */}
                          <div>
                            <div className="font-bold">{item.CategoryName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/updatecategory/${item._id}`}
                          className="btn btn-info text-white ml-2 btn-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteModal(item)}
                          className="btn btn-error text-white ml-2 btn-xs"
                        >
                          Delete
                        </button>
                      </td>
                      <td>
                        <SlideToggle
                          isOn={item.status}
                          onToggle={() => handleToggleStatus(item._id, item.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-3 flex justify-center w-full">
                <p className="font-semibold">No Data Available!</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center m-auto mt-12">
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="color-ring-loading"
              colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
            />
          </div>
        )}
      </div>
      {renderPagination()}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 opacity-75" />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Delete Confirmation</h3>
                <p>Are you sure you want to delete this item?</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-white border border-gray-300 ml-2 px-4 py-2 rounded-md"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListCategory;