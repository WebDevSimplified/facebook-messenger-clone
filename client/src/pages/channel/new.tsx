import { useMutation, useQuery } from "@tanstack/react-query"
import { FormEvent, useRef } from "react"
import { Button } from "../../components/Button"
import { FullScreenCard } from "../../components/FullScreenCard"
import { Input } from "../../components/Input"
import { Link } from "../../components/Link"
import Select, { SelectInstance } from "react-select"
import { useLoggedInAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

export function NewChannel() {
  const { streamChat, user } = useLoggedInAuth()
  const navigate = useNavigate()
  const createChannel = useMutation({
    mutationFn: ({
      name,
      memberIds,
      imageUrl,
    }: {
      name: string
      memberIds: string[]
      imageUrl?: string
    }) => {
      if (streamChat == null) throw Error("Not connected")

      return streamChat
        .channel("messaging", crypto.randomUUID(), {
          name,
          image: imageUrl,
          members: [user.id, ...memberIds],
        })
        .create()
    },
    onSuccess() {
      navigate("/")
    },
  })
  const nameRef = useRef<HTMLInputElement>(null)
  const imageUrlRef = useRef<HTMLInputElement>(null)
  const memberIdsRef =
    useRef<SelectInstance<{ label: string; value: string }>>(null)

  const users = useQuery({
    queryKey: ["stream", "users"],
    queryFn: () =>
      streamChat!.queryUsers({ id: { $ne: user.id } }, { name: 1 }),
    enabled: streamChat != null,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const name = nameRef.current?.value
    const imageUrl = imageUrlRef.current?.value
    const selectOptions = memberIdsRef.current?.getValue()
    if (
      name == null ||
      name === "" ||
      selectOptions == null ||
      selectOptions.length === 0
    ) {
      return
    }

    createChannel.mutate({
      name,
      imageUrl,
      memberIds: selectOptions.map(option => option.value),
    })
  }

  return (
    <FullScreenCard>
      <FullScreenCard.Body>
        <h1 className="text-3xl font-bold mb-8 text-center">
          New Conversation
        </h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
        >
          <label htmlFor="name">Name</label>
          <Input id="name" required ref={nameRef} />
          <label htmlFor="imageUrl">Image Url</label>
          <Input id="imageUrl" ref={imageUrlRef} />
          <label htmlFor="members">Members</label>
          <Select
            ref={memberIdsRef}
            id="members"
            required
            isMulti
            classNames={{ container: () => "w-full" }}
            isLoading={users.isLoading}
            options={users.data?.users.map(user => {
              return { value: user.id, label: user.name || user.id }
            })}
          />
          <Button
            disabled={createChannel.isLoading}
            type="submit"
            className="col-span-full"
          >
            {createChannel.isLoading ? "Loading.." : "Create"}
          </Button>
        </form>
      </FullScreenCard.Body>
      <FullScreenCard.BelowCard>
        <Link to="/">Back</Link>
      </FullScreenCard.BelowCard>
    </FullScreenCard>
  )
}
