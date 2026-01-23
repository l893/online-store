import { useEffect, Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../shared/ui';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';

const schema = yup.object({
  title: yup.string().required('Введите название'),
  slug: yup.string().required('Введите slug'),
  price: yup
    .number()
    .typeError('Введите число')
    .required('Введите цену')
    .min(0),
  categoryId: yup.string().nullable(),
  stock: yup.number().typeError('Введите число').min(0).default(0),
  image: yup.string().url('Нужен URL').nullable().optional(),
  description: yup.string().nullable(),
});

// Простая транслитерация ru->lat + очистка символов
function slugifyRu(str = '') {
  const map = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ь: '',
    ы: 'y',
    ъ: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    А: 'a',
    Б: 'b',
    В: 'v',
    Г: 'g',
    Д: 'd',
    Е: 'e',
    Ё: 'e',
    Ж: 'zh',
    З: 'z',
    И: 'i',
    Й: 'y',
    К: 'k',
    Л: 'l',
    М: 'm',
    Н: 'n',
    О: 'o',
    П: 'p',
    Р: 'r',
    С: 's',
    Т: 't',
    У: 'u',
    Ф: 'f',
    Х: 'h',
    Ц: 'ts',
    Ч: 'ch',
    Ш: 'sh',
    Щ: 'sch',
    Ь: '',
    Ы: 'y',
    Ъ: '',
    Э: 'e',
    Ю: 'yu',
    Я: 'ya',
  };
  const replaced = str
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('');
  return replaced
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS = 5000;

export const ProductForm = ({
  initial,
  onSubmit,
  submitText = 'Сохранить',
  categories = [],
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initial || {},
  });

  const [success, setSuccess] = useState(false);

  const title = watch('title');
  const [catOpt, setCatOpt] = useState(() => {
    if (!initial?.categoryId) return null;
    const found = categories.find((c) => c._id === initial.categoryId);
    return found || null;
  });

  useEffect(() => {
    reset(initial || {});
    if (initial?.categoryId) {
      const found =
        categories.find((c) => c._id === initial.categoryId) || null;
      setCatOpt(found);
    } else {
      setCatOpt(null);
    }
  }, [initial, categories, reset]);

  const onGenerateSlug = () => {
    const s = slugifyRu(title || '');
    if (s) setValue('slug', s, { shouldValidate: true, shouldDirty: true });
  };

  // когда пользователь выбирает категорию в Listbox — кладём categoryId в форму
  useEffect(() => {
    setValue('categoryId', catOpt?._id || '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [catOpt, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      setSuccess(true);
      setTimeout(
        () => setSuccess(false),
        SUCCESSFUL_ADD_ITEM_CONFIRMATION_MILLISECONDS,
      );
    } catch (e) {
      // Не обрабатываем здесь — ошибки уже идут из onSubmit или формы
    }
  };

  return (
    // <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
    <form className="space-y-3" onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <Input placeholder="Название" {...register('title')} />
        {errors.title && (
          <div className="text-sm text-red-600">{errors.title.message}</div>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="Slug (для URL)" {...register('slug')} />
          {errors.slug && (
            <div className="text-sm text-red-600">{errors.slug.message}</div>
          )}
        </div>
        <Button type="button" onClick={onGenerateSlug} className="shrink-0">
          Сгенерировать
        </Button>
      </div>

      <div>
        <Input placeholder="Цена" {...register('price')} />
        {errors.price && (
          <div className="text-sm text-red-600">{errors.price.message}</div>
        )}
      </div>

      {/* Категория — Headless UI Listbox */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Категория</label>
        <Listbox value={catOpt} onChange={setCatOpt}>
          <div className="relative">
            <ListboxButton className="w-full rounded-xl border px-3 py-2 text-left">
              {catOpt ? catOpt.name : 'Не выбрано'}
            </ListboxButton>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border bg-white shadow">
                <ListboxOption
                  value={null}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-50"
                >
                  Не выбрано
                </ListboxOption>
                {categories.map((cat) => (
                  <ListboxOption
                    key={cat._id}
                    value={cat}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-50"
                  >
                    {cat.name}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </Listbox>
        {errors.categoryId && (
          <div className="text-sm text-red-600">
            {errors.categoryId.message}
          </div>
        )}
      </div>

      <div>
        <Input placeholder="Остаток" {...register('stock')} />
        {errors.stock && (
          <div className="text-sm text-red-600">{errors.stock.message}</div>
        )}
      </div>

      <div>
        <Input placeholder="Картинка (URL)" {...register('image')} />
        {errors.image && (
          <div className="text-sm text-red-600">{errors.image.message}</div>
        )}
      </div>

      <div>
        <Input placeholder="Описание" {...register('description')} />
        {errors.description && (
          <div className="text-sm text-red-600">
            {errors.description.message}
          </div>
        )}
      </div>

      <Button disabled={isSubmitting} className="w-full">
        {submitText}
      </Button>

      {success && (
        <div className="text-green-600 bg-green-50 border border-green-200 p-2 text-sm rounded text-center">
          Товар сохранён ✅
        </div>
      )}
    </form>
  );
};
