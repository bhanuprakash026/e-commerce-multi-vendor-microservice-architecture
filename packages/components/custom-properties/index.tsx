import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import Input from "../input/index"
import { Plus, X } from 'lucide-react'

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<{ label: string, value: string[] }[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="custom_properties"
          control={control}
          render={({ field: { onChange } }) => {
            useEffect(() => {
              onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, value: [] }]);
              setNewLabel("");
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updated = [...properties];
              updated[index].value.push(newValue);
              setProperties(updated);
              setNewValue("");
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className='mt-2'>
                <label className='block font-semibold text-gray-300 mb-1'>Custom Properties</label>
                <div className="flex flex-col gap-3">
                  {properties.map((property, index) => (
                    <div key={index} className='border border-gray-700 p-3 rounded-lg bg-gray-900'>
                      <div className="flex items-center justify-between">
                        <span className='text-white font-medium'>{property.label}</span>
                        <button type="button" onClick={() => removeProperty(index)}>
                          <X size={18} className='text-red-500' />
                        </button>
                      </div>
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          type='text'
                          value={newValue}
                          className='border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full'
                          placeholder='Enter Value'
                          onChange={(e) => setNewValue(e.target.value)}
                        />
                        <button
                          type='button'
                          className='px-3 py-1 bg-blue-500 text-white rounded-md'
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.value.map((value, i) => (
                          <span key={i} className='px-2 py-1 bg-gray-700 text-white rounded-md text-sm'>{value}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder='Enter Property label ( e.g., Material, Warranty)'
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type='button'
                      className='px-3 py-1 flex items-center bg-blue-500 text-white rounded-md'
                      onClick={addProperty}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {errors?.custom_properties && (
                  <p className='text-red-500 text-sm mt-1'>{errors.custom_properties.message as string}</p>
                )}
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}

export default CustomProperties
