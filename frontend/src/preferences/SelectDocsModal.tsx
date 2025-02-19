import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActiveState } from '../models/misc';
import Modal from '../Modal';
import {
  setSelectedDocs,
  setSourceDocs,
  selectSourceDocs,
  selectSelectedDocs,
} from './preferenceSlice';
import { getDocs, Doc } from './preferenceApi';

export default function APIKeyModal({
  modalState,
  setModalState,
  isCancellable = true,
}: {
  modalState: ActiveState;
  setModalState: (val: ActiveState) => void;
  isCancellable?: boolean;
}) {
  const dispatch = useDispatch();
  const docs = useSelector(selectSourceDocs);
  const selectedDoc = useSelector(selectSelectedDocs);
  const [localSelectedDocs, setLocalSelectedDocs] = useState<Doc | null>(
    selectedDoc,
  );
  const [isDocsListOpen, setIsDocsListOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  function handleSubmit() {
    if (!localSelectedDocs) {
      setIsError(true);
    } else {
      dispatch(setSelectedDocs(localSelectedDocs));
      setModalState('INACTIVE');
      setIsError(false);
    }
  }

  function handleCancel() {
    setIsError(false);
    setModalState('INACTIVE');
  }

  useEffect(() => {
    async function requestDocs() {
      const data = await getDocs();
      dispatch(setSourceDocs(data));
    }

    requestDocs();
  }, []);
  return (
    <Modal
      handleSubmit={handleSubmit}
      isCancellable={isCancellable}
      handleCancel={handleCancel}
      modalState={modalState}
      errorMessage="Please select Source Documentation"
      isError={isError}
      render={() => {
        return (
          <article className="mx-auto mt-24 flex w-[90vw] max-w-lg  flex-col gap-4 rounded-t-lg bg-white p-6 shadow-lg">
            <p className="text-xl text-jet">Select Source Documentation</p>
            <p className="text-lg leading-5 text-gray-500">
              Please select the library of documentation that you would like to
              use with our app.
            </p>
            <div className="relative">
              <div
                className="h-10 w-full cursor-pointer border-b-2"
                onClick={() => setIsDocsListOpen(!isDocsListOpen)}
              >
                {!localSelectedDocs ? (
                  <p className="py-3 text-gray-500">Select</p>
                ) : (
                  <p className="py-3">
                    {localSelectedDocs.name} {localSelectedDocs.version}
                  </p>
                )}
              </div>
              {isDocsListOpen && (
                <div className="absolute left-0 top-10 max-h-52 w-full overflow-y-scroll bg-white">
                  {docs ? (
                    docs.map((doc, index) => {
                      if (doc.model) {
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              setLocalSelectedDocs(doc);
                              setIsDocsListOpen(false);
                            }}
                            className="h-10 w-full cursor-pointer border-x-2 border-b-2 hover:bg-gray-100"
                          >
                            <p className="ml-5 py-3">
                              {doc.name} {doc.version}
                            </p>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <div className="h-10 w-full cursor-pointer border-x-2 border-b-2 hover:bg-gray-100">
                      <p className="ml-5 py-3">No default documentation.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        );
      }}
    />
  );
}
